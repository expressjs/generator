
module.exports = {
    listUsers: async(req, res) => {
        try {
            return res.status(200).json({status: true, data: []});

        } catch (error) {
            //Ideally, you don't want to expose the message due to security concerns.
            return res.status(500).json({message: error.message, status: false });
        }
    }
}