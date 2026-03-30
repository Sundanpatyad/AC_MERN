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
            className="bg-[#0f0f0f] border border-zinc-900 rounded-[2.5rem] p-2 cursor-pointer transition-all duration-300 flex flex-col group shadow-xl"
            onClick={onCardClick}
        >
            {/* Image Area */}
            <div className="w-full relative overflow-hidden rounded-[2rem] bg-zinc-900" style={{ aspectRatio: '16/9' }}>
                {mockTest.thumbnail ? (
                    <img
                        src={mockTest.thumbnail}
                        alt={mockTest.seriesName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <FaBookOpen className="text-4xl text-zinc-800" />
                    </div>
                )}
                {/* Subtle Stats Overlay */}
                <div className="absolute top-3 right-3 flex gap-2">
                    <span className="bg-black/50 backdrop-blur-md text-[10px] text-zinc-300 px-3 py-1 rounded-full border border-white/5">
                        {mockTest.mockTests?.length + mockTest.attachments?.length || 0} Tests
                    </span>
                    {/* <span className="bg-black/50 backdrop-blur-md text-[10px] text-zinc-300 px-3 py-1 rounded-full border border-white/5">
                        {mockTest.studentsEnrolled?.length  || 0} Students
                    </span> */}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 pb-4 flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-medium text-white mb-2 line-clamp-1">
                        {mockTest.seriesName}
                    </h3>
                    <p className="text-zinc-500 text-sm flex items-center gap-2">
                        Price: <span className="text-white bg-zinc-900 px-2 py-0.5 rounded-full">{mockTest.price === 0 ? 'Free' : `₹${mockTest.price}`}</span>
                    </p>
                </div>

                {/* Actions Area */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    {!isLoggedIn ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowLoginModal(true);
                            }}
                            className="w-full py-2.5 bg-white text-black font-bold text-sm tracking-wide hover:bg-zinc-200 transition-all rounded-full"
                        >
                            LOGIN TO {mockTest.price === 0 ? 'START' : 'PURCHASE'}
                        </button>
                    ) : isEnrolled || mockTest.price === 0 ? (
                        <Link
                            to={`/view-mock/${mockTest._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full py-2.5 bg-white text-black text-center font-bold text-sm tracking-wide hover:bg-zinc-200 transition-all rounded-full"
                        >
                            START TEST
                        </Link>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            {isInCart ? (
                                <Link
                                    to="/dashboard/cart"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full sm:flex-1 py-2.5 bg-zinc-900 text-white text-center font-bold text-sm tracking-wide hover:bg-zinc-800 transition-all border border-zinc-800 rounded-full whitespace-nowrap"
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
                                    className="w-full sm:px-6 py-2.5 bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-all border border-zinc-800 rounded-full"
                                >
                                    <span className="text-sm">Add To Cart</span>
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleButtonClick(handleBuyNow);
                                }}
                                className="w-full sm:flex-1 py-2.5 bg-white text-black font-bold text-sm tracking-wide hover:bg-zinc-200 transition-all rounded-full"
                            >
                                Buy Now
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default MockTestCard;