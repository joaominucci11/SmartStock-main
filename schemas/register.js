const yup = require('yup');

const registerSchema = yup.object().shape({
    nome: yup.string().required('O nome é obrigatório'),
    email: yup.string().email().required('O e-mail é obrigatório'),
    password: yup.string().min(6).required('A senha é obrigatória'),
    token: yup.string().length(6).required('O token é obrigatório')
});

module.exports = registerSchema;
