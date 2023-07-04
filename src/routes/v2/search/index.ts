import searchController from '@/controllers/search/index';
import topsearchController from '@/controllers/search/topSearch';
import getLocation from '@/controllers/search/getLocation';
import express from 'express';

const router = express.Router();
router.post('/search', searchController);
router.get('/topSearch', topsearchController);
router.post('/getLocation', getLocation)
export default router;
