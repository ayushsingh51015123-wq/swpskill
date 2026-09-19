# SkillSwap — Decision Points

## DP1 — Rejection
When a creator declines a booking, the booking status changes to **Declined**. The client can see that status in **My Bookings** and can return to the marketplace to book another gig.

## DP2 — Double booking
A gig allows only one active booking request at a time. If a client tries to book a gig that already has a Pending or Accepted booking, the new request is blocked. This prevents double booking and keeps the creator dashboard unambiguous.

If multiple pending requests ever exist in stored data, accepting one request automatically changes the competing pending requests for the same gig to **Declined**.

## DP3 — Discovery
The marketplace supports search and category filtering, plus rating filtering and explicit sorting. Search checks the gig title, category, description, creator name, and skill tags. Smart Discovery prioritizes higher-rated gigs and then recency; users can also choose Top Rated, Newest, Lowest Price, or Highest Price. Creator cards and gig results display ratings and review counts so clients can compare creators before booking.
