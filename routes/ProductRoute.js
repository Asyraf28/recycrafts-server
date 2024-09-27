import express from 'express';
import {
    getProduct,
    getProductById,
    saveProduct,
    updateProduct,
    deleteProduct
} from '../controllers/ProductController.js';
import { verifyUser, adminOnly } from '../middleware/AuthUser.js';

const router = express.Router();

router.get('/products', verifyUser, getProduct);
router.get('/products/:id', verifyUser, getProductById);
router.post('/products', verifyUser, adminOnly, saveProduct);
router.patch('/products/:id', verifyUser, adminOnly, updateProduct);
router.delete('/products/:id', verifyUser, adminOnly, deleteProduct);

export default router;