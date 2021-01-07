// Create an instance of the Stripe object with your publishable API key
var stripe = Stripe("pk_test_51I01fHBrkAQpKhkKTajbmvSxmSaGmd8LsLCcl33ruQEKUsSbvtgAhpwrabWjcW6g4v21NYahdD57hD7r3c8H23b800rW2PAz6i");
var checkoutButton = document.getElementById("stripe-button");
checkoutButton.addEventListener("click", function () {
  fetch("/checkout", {
    method: "POST",
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (session) {
      return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .then(function (result) {
      // If redirectToCheckout fails due to a browser or network
      // error, you should display the localized error message to your
      // customer using error.message.
      if (result.error) {
        alert(result.error.message);
      }
    })
    .catch(function (error) {
      console.error("Error:", error);
    });
});