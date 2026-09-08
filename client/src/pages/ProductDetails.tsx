import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useGetProductBySlugQuery } from "@/services/productsApi";
import { useAddToCartMutation } from "@/services/cartApi";
import { toast } from "sonner";
import { useAddToWishlistMutation } from "@/services/wishlistApi";
import { useAppSelector } from "@/store/hooks";
import { useGetProductReviewsQuery, useCreateReviewMutation } from "@/services/reviewsApi";
import { StarRating } from "@/components/StarRating";

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useGetProductBySlugQuery(slug!);
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [addToWishlist, { isLoading: isAddingToWishlist }] =
    useAddToWishlistMutation();
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  if (isLoading) {
    return <div className="px-6 py-16 text-text-muted">Loading product...</div>;
  }

  if (isError || !data) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-error mb-4">Product not found.</p>
        <Link to="/shop" className="text-primary hover:underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const { product } = data;
  const displayPrice = product.discountPrice ?? product.price;
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;
  const inStock = product.stock > 0;

  async function handleAddToCart() {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await addToCart({ productId: product._id, quantity: 1 }).unwrap();
      navigate("/cart");
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : "Failed to add to cart";
      toast.error(message || "Failed to add to cart");
    }
  }

  async function handleAddToWishlist() {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await addToWishlist(product._id).unwrap();
      toast.success("Added to wishlist!");
    } catch {
      toast.error("Failed to add to wishlist");
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await createReview({ productId: product._id, rating: reviewRating, comment: reviewComment }).unwrap();
      toast.success("Review submitted!");
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : "Failed to submit review";
      toast.error(message || "Failed to submit review");
    }
  }

  const { data: reviewsData } = useGetProductReviewsQuery(product._id);
  const [createReview, { isLoading: submittingReview }] = useCreateReviewMutation();

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Image gallery */}
        <div>
          <div
            className="bg-surface rounded-card aspect-square overflow-hidden flex items-center justify-center touch-pan-y shadow-sm border border-border"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              (e.currentTarget as HTMLDivElement).dataset.startX = String(
                touch.clientX,
              );
            }}
            onTouchEnd={(e) => {
              const startX = Number(
                (e.currentTarget as HTMLDivElement).dataset.startX || 0,
              );
              const endX = e.changedTouches[0].clientX;
              const diff = startX - endX;

              if (Math.abs(diff) > 50) {
                if (diff > 0 && activeImageIndex < product.images.length - 1) {
                  setActiveImageIndex((i) => i + 1);
                } else if (diff < 0 && activeImageIndex > 0) {
                  setActiveImageIndex((i) => i - 1);
                }
              }
            }}
          >
            {product.images[activeImageIndex] ? (
              <img
                src={product.images[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-text-muted">No image</span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none">
              {product.images.map((img, index) => (
                <button
                  key={img + index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-16 h-16 rounded-default overflow-hidden flex-shrink-0 border-2 ${
                    index === activeImageIndex
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-text-muted text-sm mb-2">
            {product.category.name}
          </p>
          <h1 className="text-3xl font-display font-bold mb-2">
            {product.name}
          </h1>

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.ratings} size="md" />
              <span className="text-sm text-text-muted">
                {product.ratings.toFixed(1)} ({product.reviewCount} review{product.reviewCount > 1 ? "s" : ""})
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-primary">
              ₹{displayPrice}
            </span>
            {hasDiscount && (
              <span className="text-text-muted line-through">
                ₹{product.price}
              </span>
            )}
          </div>

          <p className="text-text mb-6">{product.description}</p>

          {product.specifications && product.specifications.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-sm mb-2">Specifications</h3>
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-2 pr-4 text-text-muted font-medium">
                        {spec.key}
                      </td>
                      <td className="py-2">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p
            className={`text-sm font-medium mb-6 ${inStock ? "text-success" : "text-error"}`}
          >
            {inStock ? `In Stock (${product.stock} available)` : "Out of Stock"}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || isAdding}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-default font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex-1 sm:flex-none"
            >
              {isAdding ? "Adding..." : "Add to Cart"}
            </button>
            <button
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
              className="border border-border hover:bg-surface px-8 py-3 rounded-default font-medium"
            >
              {isAddingToWishlist ? "Adding..." : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-16 pt-10 border-t border-border">
        <h2 className="text-xl font-display font-bold mb-6">Customer Reviews</h2>

        {user && (
          <form onSubmit={handleSubmitReview} className="border border-border rounded-card p-5 mb-8">
            <h3 className="font-medium mb-3">Write a Review</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-text-muted">Your rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className={`text-xl ${star <= reviewRating ? "text-warning" : "text-border"}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              required
              rows={3}
              placeholder="Share your experience with this product..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full border border-border rounded-default px-3 py-2 text-sm mb-3"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-5 py-2 rounded-default text-sm font-medium"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {reviewsData && reviewsData.reviews.length === 0 ? (
          <p className="text-text-muted text-sm">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-5">
            {reviewsData?.reviews.map((review) => (
              <div key={review._id} className="border-b border-border pb-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{review.user.name}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <StarRating rating={review.rating} />
                <p className="text-sm text-text mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}