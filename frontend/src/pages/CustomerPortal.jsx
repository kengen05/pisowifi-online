import React, { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import axios from "axios";
import "../styles/customer.css";

export default function CustomerPortal() {
  const [sessionData, setSessionData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [paymentExpiresIn, setPaymentExpiresIn] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentRequested, setPaymentRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingPackages, setLoadingPackages] = useState(true);

  useEffect(() => {
    // Check for existing active session from previous payment
    const checkActiveSession = async () => {
      try {
        const savedCustomerId = localStorage.getItem("pisowifi_customer_id");
        if (!savedCustomerId) return;

        const response = await axios.get(
          `/api/devices/active-session/${savedCustomerId}`,
        );

        if (response.data && response.data.remainingTime > 0) {
          console.log("✅ Found active session with remaining time:", response.data.remainingTime);
          setSessionData({
            paymentId: response.data.paymentId,
            amount: response.data.amount,
            duration: response.data.duration,
            status: "confirmed",
            startTime: new Date(response.data.startTime),
          });
          setTimeRemaining(response.data.remainingTime);
        }
      } catch (err) {
        console.warn("No active session found:", err.message);
      }
    };

    checkActiveSession();
  }, []);

  useEffect(() => {
    // Fetch packages from backend using relative URL (uses Vite proxy)
    const fetchPackages = async () => {
      try {
        setLoadingPackages(true);
        const response = await axios.get("/api/packages");
        setPackages(response.data);
        if (response.data.length > 0) {
          setSelectedPackage(response.data[0].packageId);
        }
      } catch (err) {
        console.error("Error fetching packages:", err);
        // Fallback to default packages if API fails
        setPackages([
          { packageId: "pkg1", name: "1 Hour", price: 10, duration: 60 },
          { packageId: "pkg2", name: "3 Hours", price: 25, duration: 180 },
          { packageId: "pkg3", name: "1 Day", price: 50, duration: 1440 },
          { packageId: "pkg4", name: "7 Days", price: 300, duration: 10080 },
        ]);
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  const currentPackage = packages.find((p) => p.packageId === selectedPackage);

  const handleRequestPayment = async () => {
    if (!currentPackage) {
      setError("Please select a valid package");
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // Create payment via backend API
      const response = await axios.post(
        "/api/payments/create-customer",
        {
          amount: currentPackage.price,
          sessionDuration: currentPackage.duration,
        },
      );

      // Save customer ID for persistent session tracking
      if (response.data.customerId) {
        localStorage.setItem("pisowifi_customer_id", response.data.customerId);
      }

      setSessionData({
        paymentId: response.data.paymentId,
        amount: response.data.amount,
        duration: currentPackage.duration,
        status: "pending",
      });
      setPaymentExpiresIn(300); // 5 minutes expiration
      setPaymentRequested(true);
    } catch (err) {
      setError("Failed to create payment. Please try again.");
      console.error("Payment creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirmed = async () => {
    if (!currentPackage) {
      setError("Package information not available");
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // Get client device information (IP address, browser, device type)
      let deviceIp = "unknown";
      let deviceName = "Unknown Device";
      try {
        const clientInfoResponse = await axios.get(
          "/api/client/info",
        );
        if (clientInfoResponse.data.success) {
          deviceIp = clientInfoResponse.data.clientIp;
          deviceName = `${clientInfoResponse.data.deviceType} - ${clientInfoResponse.data.browser}`;
          console.log(`Device info captured - IP: ${deviceIp}, Name: ${deviceName}`);
        }
      } catch (err) {
        console.warn("Could not get client info:", err);
        console.warn("Falling back to 'unknown' IP - this is normal for localhost development");
      }

      // Generate mock MAC address for demo (in real scenario, this comes from device)
      const mockMacAddress =
        "AA:BB:CC:DD:" +
        Math.random().toString(16).slice(2, 4).toUpperCase() +
        ":" +
        Math.random().toString(16).slice(2, 4).toUpperCase();

      // Confirm payment via backend API with captured device info
      await axios.post(
        `/api/payments/confirm/${sessionData.paymentId}`,
        {
          qrPhTransactionId:
            "QRPH-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          phoneNumber: "09171234567", // Demo phone number
          deviceMacAddress: mockMacAddress,
          deviceIp: deviceIp,
          deviceName: deviceName,
        },
      );

      setSessionData({
        ...sessionData,
        status: "confirmed",
        startTime: new Date(),
        macAddress: mockMacAddress,
        deviceIp: deviceIp,
        deviceName: deviceName,
      });
      setTimeRemaining(currentPackage.duration * 60);
    } catch (err) {
      setError("Failed to confirm payment. Please try again.");
      console.error("Payment confirmation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionData?.status === "confirmed" && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, sessionData]);

  // Auto-refresh payment status every 3 seconds while waiting for confirmation
  useEffect(() => {
    if (!paymentRequested || !sessionData?.paymentId || sessionData?.status === "confirmed") {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/payments/status/${sessionData.paymentId}`);
        
        // Check if payment status has changed to completed
        if (response.data.status === "completed") {
          console.log("✅ Payment confirmed! Auto-detected status change.");
          
          // Auto-confirm payment locally
          let deviceIp = "unknown";
          let deviceName = "Unknown Device";
          try {
            const clientInfoResponse = await axios.get("/api/client/info");
            if (clientInfoResponse.data.success) {
              deviceIp = clientInfoResponse.data.clientIp;
              deviceName = `${clientInfoResponse.data.deviceType} - ${clientInfoResponse.data.browser}`;
            }
          } catch (err) {
            console.warn("Could not get client info");
          }

          const mockMacAddress =
            "AA:BB:CC:DD:" +
            Math.random().toString(16).slice(2, 4).toUpperCase() +
            ":" +
            Math.random().toString(16).slice(2, 4).toUpperCase();

          setSessionData({
            ...sessionData,
            status: "confirmed",
            startTime: new Date(),
            macAddress: mockMacAddress,
            deviceIp: deviceIp,
            deviceName: deviceName,
          });
          if (currentPackage) {
            setTimeRemaining(currentPackage.duration * 60);
          }
        }
      } catch (err) {
        console.warn("Status check error (this is normal):", err.message);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [paymentRequested, sessionData?.paymentId, sessionData?.status, currentPackage]);

  // Payment expiration countdown (5 minutes)
  useEffect(() => {
    if (paymentRequested && paymentExpiresIn > 0 && sessionData?.status !== "confirmed") {
      const timer = setTimeout(() => {
        setPaymentExpiresIn(paymentExpiresIn - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (paymentExpiresIn === 0 && paymentRequested) {
      setError("Payment request expired. Please create a new one.");
      setTimeout(() => {
        setPaymentRequested(false);
        setSessionData(null);
      }, 2000);
    }
  }, [paymentExpiresIn, paymentRequested, sessionData?.status]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Payment expiration countdown (5 minutes)
  useEffect(() => {
    if (paymentRequested && paymentExpiresIn > 0 && sessionData?.status !== "confirmed") {
      const timer = setTimeout(() => {
        setPaymentExpiresIn(paymentExpiresIn - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (paymentExpiresIn === 0 && paymentRequested) {
      setError("Payment request expired. Please create a new one.");
      setTimeout(() => {
        setPaymentRequested(false);
        setSessionData(null);
      }, 2000);
    }
  }, [paymentExpiresIn, paymentRequested, sessionData?.status]);

  if (paymentRequested) {
    return (
      <div className="customer-container">
        <div className="payment-card">
          <h1>Scan to Pay</h1>
          
          <div className="payment-status">
            <p className="status-label">
              Status: <span className="status-badge pending">⏳ Pending</span>
            </p>
            <p className="expiration-timer">
              Expires in: <span className="timer-value">{formatTime(paymentExpiresIn || 0)}</span>
            </p>
          </div>

          <p className="payment-amount">
            Amount: ₱{currentPackage?.price || sessionData?.amount}
          </p>

          <div className="qr-container">
            <QRCode
              value={JSON.stringify({
                paymentId: sessionData.paymentId,
                amount: sessionData.amount,
                merchant: "Piso WiFi",
              })}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="payment-instructions">
            <h3>How to Pay:</h3>
            <ol>
              <li>Open your QR PH app or GCash app</li>
              <li>Select "Scan QR" or "Pay QR"</li>
              <li>Scan the QR code above</li>
              <li>Confirm the payment</li>
              <li>You'll get instant internet access!</li>
            </ol>
          </div>

          <p className="payment-id">
            Payment ID: <strong>{sessionData.paymentId}</strong>
          </p>

          {error && <div className="error-message">{error}</div>}

          <button
            onClick={handlePaymentConfirmed}
            className="btn-payment-confirmed"
            disabled={loading}
          >
            {loading ? "Confirming..." : "Payment Confirmed?"}
          </button>

          <button
            onClick={() => setPaymentRequested(false)}
            className="btn-back"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-container">
      {sessionData?.status === "confirmed" && timeRemaining > 0 && (
        <div className="active-session-banner">
          <div className="session-status">
            <div className="status-indicator">🟢</div>
            <div className="session-info-content">
              <p className="session-title">✓ Active Connection</p>
              <p className="session-time">Time Remaining: <strong>{formatTime(timeRemaining)}</strong></p>
              <p className="session-package">Package: <strong>{currentPackage?.name || "WiFi Access"}</strong></p>
            </div>
            <button
              onClick={() => {
                setPaymentRequested(false);
                setSessionData(null);
                setError(null);
              }}
              className="btn-buy-more"
            >
              Buy More Time
            </button>
          </div>
        </div>
      )}
      <div className="welcome-card">
        <div className="logo">📶</div>
        <h1>Piso WiFi</h1>
        <p className="subtitle">Fast & Affordable Internet Access</p>

        <div className="connection-guide">
          <h2>How to Connect</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Search WiFi Networks</h3>
                <p>
                  Look for network: <strong>PisoWiFi-Public</strong>
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Connect</h3>
                <p>Select the network and connect (no password needed)</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Open Browser</h3>
                <p>Open any browser - this page will appear automatically</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Select Package & Pay</h3>
                <p>Choose your plan and scan the QR code to pay</p>
              </div>
            </div>
          </div>
        </div>

        <div className="packages-section">
          <h2>Select Your Package</h2>
          {loadingPackages ? (
            <p>Loading packages...</p>
          ) : packages.length === 0 ? (
            <p>No packages available</p>
          ) : (
            <div className="packages-grid">
              {packages.map((pkg) => (
                <div
                  key={pkg.packageId}
                  className={`package-card ${selectedPackage === pkg.packageId ? "selected" : ""}`}
                  onClick={() => setSelectedPackage(pkg.packageId)}
                >
                  <h3>{pkg.name}</h3>
                  <p className="price">₱{pkg.price}</p>
                  <p className="duration">
                    {pkg.duration >= 1440
                      ? `${Math.floor(pkg.duration / 1440)} day(s)`
                      : `${pkg.duration} mins`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleRequestPayment}
          className="btn-pay"
          disabled={loading || !currentPackage || loadingPackages}
        >
          {loading
            ? "Processing..."
            : currentPackage
              ? `Pay ₱${currentPackage.price} Now`
              : "Loading..."}
        </button>

        <div className="payment-methods">
          <p>Accepted Payment Methods:</p>
          <div className="methods-icons">
            <span>💳 GCash</span>
            <span>📱 QR PH</span>
            <span>🏦 Bank Transfer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
