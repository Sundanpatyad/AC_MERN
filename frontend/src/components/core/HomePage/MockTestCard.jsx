import React, { useEffect, useState } from "react";
import { FaBookOpen, FaShoppingCart } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const MockTestCard = React.memo(({
    mockTest,
    handleAddToCart,
    handleBuyNow,
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

    const isEnrolled = Boolean(mockTest.isEnrolled) || Boolean(isPurchased);

    const handleButtonClick = (action) => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
        } else {
            action(mockTest);
        }
    };

    const testCount =
        (mockTest.mockTestsCount ?? mockTest.mockTests?.length ?? 0) +
        (mockTest.attachmentsCount ?? mockTest.attachments?.length ?? 0);

    return (
        <div
            className="group relative flex flex-col cursor-pointer"
            onClick={onCardClick}
        >
            <div className="w-full relative overflow-hidden rounded-xl bg-surface aspect-[16/10]">
                {mockTest.thumbnail ? (
                    <img
                        src={mockTest.thumbnail}
                        alt={mockTest.seriesName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FaBookOpen className="text-3xl text-subtle" />
                    </div>
                )}

                <span className="absolute bottom-2 right-2 text-[11px] font-semibold text-white bg-black/80 px-2 py-0.5 rounded-md">
                    {testCount} tests
                </span>
            </div>

            <div className="pt-3 flex flex-col flex-grow">
                <h3 className="text-sm font-semibold text-fg line-clamp-2 leading-snug">
                    {mockTest.seriesName}
                </h3>
                <p className="text-sm text-muted mt-1 mb-4">
                    {mockTest.price === 0 ? 'Free' : `₹${mockTest.price}`}
                </p>

                <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
                    {!isLoggedIn ? (
                        <button
                            onClick={(e) => { e.preventDefault(); setShowLoginModal(true); }}
                            className="btn-primary w-full"
                        >
                            Login to {mockTest.price === 0 ? 'start' : 'buy'}
                        </button>
                    ) : isEnrolled || mockTest.price === 0 ? (
                        <Link to={`/view-mock/${mockTest._id}`} className="btn-primary w-full">
                            Start now
                        </Link>
                    ) : (
                        <div className="flex gap-2 w-full">
                            {isInCart ? (
                                <Link to="/dashboard/cart" className="btn-secondary flex-1">
                                    In cart
                                </Link>
                            ) : (
                                <button
                                    onClick={(e) => { e.preventDefault(); handleButtonClick(handleAddToCart); }}
                                    aria-label="Add to cart"
                                    className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-muted hover:text-fg hover:bg-elevated transition-colors"
                                >
                                    <FaShoppingCart size={13} />
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.preventDefault(); handleButtonClick(handleBuyNow); }}
                                className="btn-primary flex-1"
                            >
                                Buy now
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default MockTestCard;
