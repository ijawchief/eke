export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16 prose">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().getFullYear()}</p>
      <p>
        We collect your email and phone number at checkout to fulfill your order and send you
        access to purchased products. We do not sell your personal data. Payment processing is
        handled by Paystack — we never see or store your card details.
      </p>
      <h2>Tracking</h2>
      <p>
        We use Meta Pixel to measure ad performance. Purchase events are shared with Meta in
        hashed form (SHA-256) and are not used to identify you individually.
      </p>
      <h2>Contact</h2>
      <p>To request data deletion, email us at support@eke.ng</p>
    </main>
  );
}
