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
            className="relative flex flex-col bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2.5 cursor-pointer overflow-hidden"
            onClick={onCardClick}
        >
            {/* Image Area */}
            <div className="w-full relative overflow-hidden rounded-[1.5rem] bg-black/50 aspect-video">
                {mockTest.thumbnail ? (
                    <img
                        src={mockTest.thumbnail}
                        alt={mockTest.seriesName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <FaBookOpen className="text-4xl text-white/20" />
                    </div>
                )}

                {/* Top Badges overlay */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
                    <span className="bg-black/60 backdrop-blur-md text-[10px] font-medium tracking-wide text-white px-3 py-1.5 rounded-full border border-white/20 uppercase">
                        {mockTest.mockTests?.length + (mockTest.attachments?.length || 0)} Tests
                    </span>
                    <span className="bg-black/60 backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 text-white shadow-lg">
                        {mockTest.price === 0 ? 'FREE' : `₹${mockTest.price}`}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="pt-5 px-3 pb-2 flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 line-clamp-2">
                        {mockTest.seriesName}
                    </h3>
                </div>

                {/* Actions Area */}
                <div className="mt-6 pt-4 border-t border-white/10 w-full" onClick={(e) => e.stopPropagation()}>
                    {!isLoggedIn ? (
                        <button
                            onClick={(e) => { e.preventDefault(); setShowLoginModal(true); }}
                            className="w-full py-3 bg-white text-black font-bold text-sm tracking-wide active:scale-95 transition-transform rounded-full shadow-lg"
                        >
                            LOGIN TO {mockTest.price === 0 ? 'START' : 'PURCHASE'}
                        </button>
                    ) : isEnrolled || mockTest.price === 0 ? (
                        <Link
                            to={`/view-mock/${mockTest._id}`}
                            className="block w-full py-3 bg-white text-black text-center font-bold text-sm tracking-wide active:scale-95 transition-transform rounded-full shadow-lg"
                        >
                            START TEST
                        </Link>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                            {isInCart ? (
                                <Link
                                    to="/dashboard/cart"
                                    className="flex-1 py-3 bg-black/50 text-white text-center font-bold text-sm tracking-wide border border-white/20 rounded-full active:scale-95 transition-transform"
                                >
                                    GO TO CART
                                </Link>
                            ) : (
                                <button
                                    onClick={(e) => { e.preventDefault(); handleButtonClick(handleAddToCart); }}
                                    className="flex-1 py-3 bg-black/50 text-white font-bold text-sm tracking-wide border border-white/20 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                >
                                    <FaShoppingCart /> 
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.preventDefault(); handleButtonClick(handleBuyNow); }}
                                className="flex-1 py-3 bg-white text-black font-bold text-sm tracking-wide rounded-full shadow-lg active:scale-95 transition-transform"
                            >
                                BUY NOW
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default MockTestCard;