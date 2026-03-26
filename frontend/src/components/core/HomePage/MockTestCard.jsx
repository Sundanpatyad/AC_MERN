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
    onCardClick,
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
        <div
            className="bg-black border border-zinc-800 rounded-md overflow-hidden cursor-pointer flex flex-col transition-colors duration-200 hover:border-zinc-500"
            onClick={onCardClick}
        >
            <div className="w-full border-b border-zinc-800" style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                {mockTest.thumbnail ? (
                    <img
                        src={mockTest.thumbnail}
                        alt={mockTest.seriesName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 p-4">
                        <FaBookOpen className="text-4xl text-zinc-700" />
                    </div>
                )}
            </div>
            
            <div className="p-5 flex-grow flex flex-col justify-between bg-black">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-snug">
                        {mockTest.seriesName}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                        {mockTest.description}
                    </p>
                </div>
                
                <div className="flex justify-between items-center text-sm mb-5 pb-4 border-b border-zinc-800/50">
                    <div className="font-bold text-white">
                        {mockTest.price === 0 ? 'Free' : `₹${mockTest.price}`}
                    </div>
                    <div className="flex items-center text-gray-400">
                        <FaBookOpen className="mr-2" />
                        <span>{mockTest.mockTests?.length + mockTest.attachments?.length || 0} Tests</span>
                    </div>
                </div>
                
                <div className="flex flex-col space-y-2 mt-auto">
                    {isLoggedIn ? (
                        isEnrolled || mockTest.price === 0 ? (
                            <Link
                                to={`/view-mock/${mockTest._id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full py-3 px-4 bg-white text-black text-center font-bold text-sm tracking-wide hover:bg-gray-200 transition-colors rounded-sm"
                            >
                                START TEST
                            </Link>
                        ) : (
                            <div className="flex gap-2">
                                {isInCart ? (
                                    <Link
                                        to="/dashboard/cart"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full flex-1 py-3 px-4 bg-zinc-900 text-white text-center font-bold text-sm tracking-wide hover:bg-zinc-800 transition-colors border border-zinc-700 rounded-sm whitespace-nowrap"
                                    >
                                        GO TO CART
                                    </Link>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleButtonClick(handleAddToCart);
                                        }}
                                        className="py-3 px-4 bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors border border-zinc-700 rounded-sm"
                                    >
                                        <FaShoppingCart className="text-lg" />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleButtonClick(handleBuyNow);
                                    }}
                                    className="w-full flex-[2] py-3 px-4 bg-white text-black font-bold text-sm tracking-wide hover:bg-gray-200 transition-colors rounded-sm"
                                >
                                    BUY NOW
                                </button>
                            </div>
                        )
                    ) : (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowLoginModal(true);
                            }}
                            className="w-full py-3 px-4 bg-white text-black font-bold text-sm tracking-wide hover:bg-gray-200 transition-colors rounded-sm"
                        >
                            LOGIN TO {mockTest.price === 0 ? 'START' : 'PURCHASE'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

export default MockTestCard;