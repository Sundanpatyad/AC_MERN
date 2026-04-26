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

    const testCount = mockTest.mockTests?.length + (mockTest.attachments?.length || 0);

    return (
        <div
            className="group relative flex flex-col glass glass-hover rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 hover:translate-y-[-8px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            onClick={onCardClick}
        >
            {/* Thumbnail */}
            <div className="w-full relative overflow-hidden bg-white/[0.02] aspect-[16/10]">
                {mockTest.thumbnail ? (
                    <img
                        src={mockTest.thumbnail}
                        alt={mockTest.seriesName}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FaBookOpen className="text-4xl text-white/5" />
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                {/* Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <span className="text-[10px] font-bold tracking-widest text-white/80 bg-white/[0.05] backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 uppercase">
                        {testCount} Tests
                    </span>
                    <span className="text-xs font-bold text-black bg-white px-3 py-1.5 rounded-full shadow-lg">
                        {mockTest.price === 0 ? 'FREE' : `₹${mockTest.price}`}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-base font-semibold text-white/90 line-clamp-2 leading-tight mb-6 group-hover:text-white transition-colors">
                    {mockTest.seriesName}
                </h3>

                {/* Action */}
                <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
                    {!isLoggedIn ? (
                        <button
                            onClick={(e) => { e.preventDefault(); setShowLoginModal(true); }}
                            className="w-full py-3.5 rounded-2xl text-xs font-bold tracking-widest uppercase bg-white text-black hover:bg-white/90 transition-all active:scale-95"
                        >
                            Login to {mockTest.price === 0 ? 'Start' : 'Purchase'}
                        </button>
                    ) : isEnrolled || mockTest.price === 0 ? (
                        <Link
                            to={`/view-mock/${mockTest._id}`}
                            className="block w-full py-3.5 rounded-2xl text-xs font-bold tracking-widest uppercase text-center bg-white text-black hover:bg-white/90 transition-all active:scale-95"
                        >
                            Start Now
                        </Link>
                    ) : (
                        <div className="flex gap-3 w-full">
                            {isInCart ? (
                                <Link
                                    to="/dashboard/cart"
                                    className="flex-1 py-3.5 rounded-2xl text-xs font-bold tracking-widest uppercase text-white/70 text-center glass glass-hover transition-all"
                                >
                                    In Cart
                                </Link>
                            ) : (
                                <button
                                    onClick={(e) => { e.preventDefault(); handleButtonClick(handleAddToCart); }}
                                    className="w-12 h-12 rounded-2xl glass glass-hover flex items-center justify-center transition-all group/cart"
                                >
                                    <FaShoppingCart className="text-white/40 group-hover/cart:text-white transition-colors" />
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.preventDefault(); handleButtonClick(handleBuyNow); }}
                                className="flex-1 py-3.5 rounded-2xl text-xs font-bold tracking-widest uppercase bg-white text-black hover:bg-white/90 transition-all active:scale-95"
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