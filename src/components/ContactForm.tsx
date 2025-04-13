"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Adjust the import path as necessary

export const ContactForm = () => {
  const [name, setName] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [comments, setComments] = useState<{ name: string; comment: string; rating: number }[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [isLightTheme, setIsLightTheme] = useState<boolean>(true);

  // Detect theme (light or dark)
  useEffect(() => {
    const matchMedia = window.matchMedia("(prefers-color-scheme: light)");
    setIsLightTheme(matchMedia.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsLightTheme(e.matches);
    };

    matchMedia.addEventListener("change", handleChange);
    return () => matchMedia.removeEventListener("change", handleChange);
  }, []);

  // Fetch comments and calculate average rating
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "comments"));
        const fetchedComments = querySnapshot.docs.map((doc) => doc.data() as { name: string; comment: string; rating: number });
        setComments(fetchedComments);

        // Calculate average rating
        const totalRating = fetchedComments.reduce((sum, item) => sum + item.rating, 0);
        const avgRating = fetchedComments.length > 0 ? totalRating / fetchedComments.length : 0;
        setAverageRating(avgRating);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    fetchComments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !comment.trim() || rating < 1 || rating > 5) {
      setError("Name, comment, and a valid rating (1–5) are required.");
      setSuccess("");
      return;
    }

    try {
      // Save data to Firebase
      await addDoc(collection(db, "comments"), { name, comment, rating, timestamp: new Date() });
      setName("");
      setComment("");
      setRating(0);
      setError("");
      setSuccess("Your comment and rating have been submitted successfully!");

      // Update comments list
      setComments((prev) => [...prev, { name, comment, rating }]);
      setAverageRating((prevAvg) => (prevAvg * comments.length + rating) / (comments.length + 1));
    } catch (err) {
      console.error("Error saving comment:", err);
      setError("Failed to submit your comment. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        margin: "0 auto",
        padding: "40px",
        border: "1px solid #ccc",
        borderRadius: "12px",
        color: isLightTheme ? "#000" : "#fff",
        backgroundColor: isLightTheme ? "" : "",
      }}
    >
      <h2 style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}>Leave a Comment</h2>
      <p style={{ textAlign: "center", fontSize: "18px", marginBottom: "20px" }}>
        <strong>Average Rating:</strong> {"★".repeat(Math.round(averageRating))} ({averageRating.toFixed(1)})
      </p>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div>
          <label htmlFor="name" style={{ display: "block", marginBottom: "8px", fontSize: "16px" }}>
            Name:
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        </div>
        <div>
          <label htmlFor="comment" style={{ display: "block", marginBottom: "8px", fontSize: "16px" }}>
            Comment:
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        </div>
        <div>
  <label htmlFor="rating" style={{ display: "block", marginBottom: "8px", fontSize: "16px" }}>
    Rating:
  </label>
  <div style={{ display: "flex", gap: "5px", fontSize: "24px", cursor: "pointer" }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        onClick={() => setRating(star)}
        style={{
          color: star <= rating ? "#FFD700" : "#ccc", // Highlight selected stars
        }}
      >
        ★
      </span>
    ))}
  </div>
</div>
        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
        {success && <p style={{ color: "green", fontSize: "14px" }}>{success}</p>}
        <button
          type="submit"
          style={{
            padding: "12px 20px",
            borderRadius: "6px",
            background: "#007BFF",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Submit
        </button>
      </form>

      <div style={{ marginTop: "30px" }}>
        <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>Comments</h3>
        {comments.length > 0 ? (
          <ul style={{ listStyle: "none", padding: "0" }}>
            {comments.map((item, idx) => (
              <li
                key={idx}
                style={{
                  marginBottom: "15px",
                  padding: "15px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  backgroundColor: isLightTheme ? "#fff" : "#444",
                  color: isLightTheme ? "#000" : "#fff",
                }}
              >
                <p style={{ marginBottom: "8px", fontSize: "16px" }}>
                  <strong>{item.name}</strong> {"★".repeat(item.rating)}
                </p>
                <p style={{ fontSize: "14px" }}>{item.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: "16px" }}>No comments yet.</p>
        )}
      </div>
    </div>
  );
};