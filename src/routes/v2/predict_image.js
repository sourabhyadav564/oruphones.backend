const express = require('express');
const router = express.Router();
const multer = require('multer');
const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');

const upload = multer({ dest: 'uploads/' });

let model;
mobilenet.load().then(loadedModel => {
  model = loadedModel;
  console.log('MobileNet model loaded');
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imageBuffer = req.file.buffer;
    
    const tfimage = tf.node.decodeImage(imageBuffer, 3);
    const tfresized = tf.image.resizeBilinear(tfimage, [224, 224]);
    const tfexpanded = tfresized.expandDims(0);
    const tfpreprocessed = tfexpanded.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1.0));
    
    const predictions = await model.classify(tfpreprocessed);
    
    res.json(predictions);
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process the image' });
  }
});


module.exports = router