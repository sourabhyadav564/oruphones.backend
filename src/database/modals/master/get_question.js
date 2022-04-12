const mongoose = require('mongoose');
const validator = require('validator');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    }, 
    questionId: {
        type: Number,
        required: true,
    },
    componentType: {
        type: String,
        required: true,
    },
    componenetOptions: {
        type: [{
            optionName: {
                type: String,
                required: true,
            },
            optionMessage: {
                type: String,
                required: true,
            },
        }],
        required: true,
    },
    infoTemplateUrl: {
        type: String,
    },
    childQuestionTitile: {
        type: String,
    },
    childQuestions: {
        type: [{
            question: {
                type: String,
            },
            componentType: {
                type: String,
            },
            questionId: {
                type: Number,
            },
            infoTemplateUrl: {
                type: String,
            },
            componenetOptions: {
                type: [{
                    optionName: {
                        type: String,
                    },
                    optionMessage: {
                        type: String,
                    }
                }]
            }
        }]
    }
},{ timestamps: true })

const questionModal = new mongoose.model('device_condition_questions', questionSchema);

module.exports = questionModal