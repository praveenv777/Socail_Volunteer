// FundDetails.jsx
import React, { useEffect, useState } from 'react';
import './FundDetails.scss';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BlueButton from '../../../components/BlueButton/BlueButton';
import useAuth from '../../../hooks/useAuth';
import fallback from '../../../assets/blossom_fallback.jpg';
import toast from 'react-hot-toast';
import { BsClock } from 'react-icons/bs';
import moment from 'moment';
import axios from 'axios';
import Warning from '../../../components/Warning/Warning';

const FundDetails = () => {
    const navigate = useNavigate();
    const { id: fundId } = useParams();
    const { _id: selfId } = useAuth();

    // states
    const [fundDetails, setFundDetails] = useState({});
    const [donors, setDonors] = useState([]);
    const [showDonate, setShowDonate] = useState(false);
    const [donationAmount, setDonationAmount] = useState(20);
    const [donorName, setDonorName] = useState('');

    const goback = () => navigate('/');

    const fetchFundDetails = async () => {
        try {
            const data = await axios.get(`${import.meta.env.VITE_API_ENDPOINT}/funds/${fundId}`);
            if (!data?.data?.result) {
                toast.error(data?.data?.message);
                return;
            }
            toast.success("Fetched fundraise");
            setFundDetails(data?.data?.result);
            console.log(data?.data?.result);
            selfId === data?.data?.result?.userId ? setShowDonate(false) : setShowDonate(true);
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }

    // Donation without Stripe
    const makeDonation = async (e) => {
        e.preventDefault();
        if (donationAmount < 20) {
            toast.error("Minimum donation amount is INR 20");
            return;
        }
        if (donationAmount > (fundDetails?.amount - fundDetails?.amountRaised)) {
            toast.error("Amount exceeds acceptance limit");
            return;
        }
        if (!donorName.trim()) {
            toast.error("Donor name is required");
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_ENDPOINT}/donations`, {
                fundId,
                donorName,
                donationAmount,
            });
            if (response.data.message === 'Donation successful!') {
                toast.success("Donation successful!");
                setDonationAmount(20);
                setDonorName('');
                fetchFundDetails();
                fetchDonors();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }

    // fetch donors
    const fetchDonors = async () => {
        try {
            const data = await axios.get(`${import.meta.env.VITE_API_ENDPOINT}/funds/donors/${fundId}`);
            if (!data?.data?.result) throw new Error("Failed to fetch donors");
            // success
            setDonors(data?.data?.result);
        } catch (error) {
            console.log(error.message);
        }
    }

    useEffect(() => {
        fetchFundDetails();
        fetchDonors();
    }, []);

    return (
        <>
            <div className='fund-details-wrapper'>
                <BlueButton
                    text={"←"}
                    handleClick={goback}
                />
                <h1>{fundDetails?.title}</h1>
                <h2> - {fundDetails?.orgName}</h2>
                <div className="details-subparent">
                    <div className="main-content">
                        <img src={fundDetails?.imageURL || fallback} alt="fund" />
                        <div className="text-content">
                            <p>{fundDetails?.description}</p>
                            <p><b>Cause</b> : {fundDetails?.cause}</p>
                            <p><b>Deadline</b> : <BsClock /> {moment(fundDetails?.deadline).format("DD MMM YYYY")}</p>
                            <p className={fundDetails?.status === "Open" ? "status open" : fundDetails?.status === "Close" ? "status close" : 'status hold'}>{fundDetails?.status}</p>
                            <h3>Amount Raising : ₹{fundDetails?.amount}</h3>
                            <h3>Amount Raised : ₹{fundDetails?.amountRaised}</h3>
                            <div>
                                {fundDetails?.status === "Open" ?
                                    <form
                                        className="donate-form"
                                        onSubmit={makeDonation}>
                                        <input
                                            type="text"
                                            value={donorName}
                                            onChange={(e) => setDonorName(e.target.value)}
                                            placeholder="Your Name"
                                            required
                                        />
                                        <input
                                            type="number"
                                            min="20"
                                            max={fundDetails?.amount - fundDetails?.amountRaised}
                                            value={donationAmount}
                                            onChange={(e) => setDonationAmount(Number(e.target.value))}
                                            required
                                        />
                                        <BlueButton
                                            text={"Donate"} />
                                    </form>
                                    :
                                    <h4 style={{ color: 'red', textAlign: 'center' }}>No donations to closed fundraise</h4>
                                }
                            </div>
                        </div>
                    </div>
                    <ul className="donors-list">
                        <h2 style={{ fontSize: '1.8rem', textAlign: 'center', margin: '1rem 0', color: 'white' }}>Donors</h2>
                        {
                            donors?.length > 0 ?
                                donors?.map((item) => (
                                    <li key={item._id}>
                                        <img src={item?.profileImage || fallback} alt="profile" />
                                        <Link to={`/profile/public/${item?._id}`}>{item?.donorName}</Link>
                                        <span> - ₹{item?.donationAmount}</span>
                                    </li>
                                ))
                                :
                                <p className='result-message' style={{ marginTop: '50%', color: 'white', fontSize: '1rem' }}>No donors to show</p>
                        }
                    </ul>
                </div>
            </div>
            <div>
                <Warning text={"Make sure to read all the details before making any donation."} />
            </div>
        </>
    )
}

export default FundDetails;