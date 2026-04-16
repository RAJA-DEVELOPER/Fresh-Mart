const getTest = (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Test route is working perfectly!'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTest
};
