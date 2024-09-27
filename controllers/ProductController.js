import Product from "../models/ProductModel.js";
import User from "../models/UserModel.js";
import path from "path";
import fs from "fs";

export const getProduct = async(req, res) => {
    try {
        const response = await Product.findAll({
            attributes:['uuid','name', 'desc','price', 'image', 'url'],
                include:[{
                    model: User,
                    attributes:['name','email']
                }]
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getProductById = async(req, res) => {
    try {
        const product = await Product.findOne({
            where: {
                uuid: req.params.id
            },
            attributes:['uuid','name', 'desc','price', 'image', 'url'],
            include:[{
                model: User,
                attributes:['name','email']
            }]
        });
        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const saveProduct = async (req, res) => {
    if (req.role !== "admin") {
        return res.status(403).json({ msg: "Akses terlarang: hanya admin!" });
    }

    if (!req.files || !req.files.file) {
        return res.status(400).json({ msg: "No File Uploaded" });
    }

    const name = req.body.name; 
    const desc = req.body.desc;
    const price = req.body.price;

    if (!name || !desc || !price) {
        return res.status(400).json({ msg: "Name, description, and price are required" });
    }

    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType = ['.png', '.jpg', '.jpeg'];

    if (!allowedType.includes(ext.toLowerCase())) {
        return res.status(422).json({ msg: "Invalid Images" });
    }
    if (fileSize > 5000000) {
        return res.status(422).json({ msg: "Image must be less than 5 MB" });
    }

    try {
        await file.mv(`./public/images/${fileName}`);

        const newProduct = await Product.create({
            name: name,
            desc: desc,
            price: parseInt(price),
            image: fileName,
            url: url,
            userId: req.userId
        });

        res.status(201).json({ msg: "Product Created Successfully", product: newProduct });
    } catch (error) {
        console.error('Error in saveProduct:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ msg: error.errors.map(e => e.message) });
        }
        res.status(500).json({ msg: "An error occurred while saving the product" });
    }
}

export const updateProduct = async(req, res) => {
    if (req.role !== "admin") {
        return res.status(403).json({ msg: "Akses terlarang: hanya admin yang dapat meng-update produk" });
    }
    const product = await Product.findOne({
        where:{
            uuid: req.params.id
        }
    });
    if(!product) return res.status(404).json({msg: "No Data Found"});

    let fileName = "";
    if(req.files === null){
        fileName = product.image;
    } else {
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];

        if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid Images"});
        if(fileSize > 5000000) return res.status(422).json({msg: "Image must be less than 5 MB"});

        const filepath = `./public/images/${product.image}`;
        fs.unlinkSync(filepath);

        file.mv(`./public/images/${fileName}`, (err)=>{
            if(err) return res.status(500).json({msg: err.message});
        });
    }
    const name = req.body.name;
    const desc = req.body.desc;
    const price = req.body.price;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

    try {
        await Product.update({
            name: name, 
            desc: desc,
            price: price,
            image: fileName, 
            url: url
        },{
            where:{
                id: product.id
            }
        });
        res.status(200).json({msg: "Product Updated Successfuly"});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const deleteProduct = async(req, res) => {
    const product = await Product.findOne({
        where: {
            uuid: req.params.id
        }
    });
    if(!product) return res.status(404).json({msg: "No Data Found"});
    if (req.role !== "admin") {
        return res.status(403).json({ msg: "Akses terlarang: hanya admin yang dapat menghapus produk" });
    }
    try {
        const filepath = `./public/images/${product.image}`;
        fs.unlinkSync(filepath);
        await Product.destroy({
            where:{
                id: product.id
            }
        });
        res.status(200).json({msg: "Product Deleted Successfully"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}
