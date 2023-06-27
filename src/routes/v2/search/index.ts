import searchController from '@/controllers/search/index';
import topsearchController from '@/controllers/search/topSearch';
import express from 'express';

const router = express.Router();
router.post('/search', searchController);
router.get('/topSearch', topsearchController);
export default router;
