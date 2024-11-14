import React, { useEffect, useState } from "react";
import { FaBookOpen, FaShoppingCart } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const MockTestCard = React.memo(({ 
  mockTest, 
  handleAddToCart, 
  handleRemoveFromCart, 
  handleBuyNow, 
  handleStartTest, 
  setShowLoginModal, 
  isLoggedIn, 
  userId,
  isPurchased 
}) => {
    const { cart } = useSelector((state) => state.cart);
    const [isInCart, setIsInCart] = useState(false);

    useEffect(() => {
        setIsInCart(cart.some(item => item._id === mockTest._id));
    }, [cart, mockTest._id]);

    const isEnrolled = mockTest.studentsEnrolled?.includes(userId) || isPurchased;

    const handleButtonClick = (action) => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
        } else {
            action(mockTest);
        }
    };

    return (
        <Link to={`/mock-test/${mockTest._id}`}
            className="bg-zinc-900 border-2 border-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer flex flex-col"
        >
            <div className="relative h-36 bg-gradient-to-br from-gray-800 to-black">
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 p-3">
                    <h3 className="text-lg font-bold text-white text-center">{mockTest.seriesName}</h3>
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
                <p className="text-sm text-gray-400 mb-3 line-clamp-3">{mockTest.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
                    <div className="flex items-center">
                        <p className='text-md bg-white text-black px-5 rounded-full font-semibold'>{mockTest.price === 0 ? 'Free' : `₹  ${mockTest.price}`}</p>
                    </div>
                    <div className="flex items-center">
                        <FaBookOpen className="mr-1 text-gray-400" />
                        <p className="font-medium">{mockTest.mockTests?.length || 0} Tests</p>
                    </div>
                </div>
                <div className="flex flex-col space-y-2">
                    {isLoggedIn ? (
                        isEnrolled || mockTest.price === 0 ? (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleStartTest(mockTest._id);
                                }}
                                className="w-full py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 transition duration-300 text-center"
                            >
                                Start Test
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                {isInCart ? (
                                    <Link
                                        to="/dashboard/cart"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-zinc-700 transition duration-300 text-center"
                                    >
                                        Go to Cart
                                    </Link>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleButtonClick(handleAddToCart);
                                        }}
                                        className=" py-2 px-4 bg-zinc-800 text-white rounded-lg text-sm font-semibold hover:bg-zinc-700 transition duration-300"
                                    >
                                        <FaShoppingCart className="inline-block" />
                                     </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleButtonClick(handleBuyNow);
                                    }}
                                    className="w-full py-2 px-4 bg-slate-200 text-zinc-900 rounded-lg text-sm font-semibold hover:bg-gray-200 transition duration-300"
                                >
                                    Buy Now
                                </button>
                            </div>
                        )
                    ) : (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setShowLoginModal(true);
                            }}
                            className="w-full py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 transition duration-300 text-center"
                        >
                            Login to {mockTest.price === 0 ? 'Start' : 'Purchase'}
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
});

export default MockTestCard;