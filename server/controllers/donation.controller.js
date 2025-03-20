// controllers/donation.controller.js (Update getDonors)
const getDonors = async (req, res) => {
    const { id: fundId } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(fundId)) {
      return res.status(422).json({ message: "Id invalid" });
    }
  
    try {
      const donors = await Donation.find({ fundId }).select('_id donorName donationAmount profileImage');
      if (!donors) throw new Error("Failed to fetch donors");
      return res.status(200).json({ message: "Fetched fundraise donors successfully", result: donors });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error.message });
    }
  }
  
  module.exports = { addDonation, getDonors };