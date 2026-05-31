const stripe = Stripe(window.STRIPE_PUBLIC_KEY);

let elements = null;

const detailsForm = document.getElementById("details-form");
const continueButton = document.getElementById("continue-button");
const payButton = document.getElementById("pay-button");
const paymentMessage = document.getElementById("payment-message");
const paymentElementWrapper = document.getElementById("payment-element-wrapper");
const paymentCardLocked = document.getElementById("payment-card-locked");

detailsForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!detailsForm.checkValidity()) {
        detailsForm.reportValidity();
        return;
    }

    continueButton.disabled = true;
    continueButton.innerText = "Loading payment...";

    const formData = new FormData(detailsForm);

    const response = await fetch("/create-payment-intent", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    if (!response.ok || data.error) {
        paymentMessage.innerText = data.error || "Something went wrong.";
        continueButton.disabled = false;
        continueButton.innerText = "Continue to Payment →";
        return;
    }

    elements = stripe.elements({ clientSecret: data.client_secret });
    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");

    paymentCardLocked.classList.add("hidden");
    paymentElementWrapper.classList.remove("hidden");

    continueButton.disabled = false;
    continueButton.innerText = "Details Saved ✓";
    continueButton.disabled = true;
});

payButton.addEventListener("click", async function () {
    payButton.disabled = true;
    payButton.innerText = "Processing...";

    const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            // @NickKaralis change later for production
            return_url: "http://127.0.0.1:5000/payment_success"
        }
    });

    if (error) {
        paymentMessage.innerText = error.message;
        payButton.disabled = false;
        payButton.innerText = "Pay Now";
    }
});