var displayError=document.getElementById('card-errors');
function errorHandler(err){
	changeLoadingState(false);
	displayError.textContent=err;
}


var orderData ={
	items: [{ id: "hangout-registration-fee" }],
	currency: "inr"
};	

// document.querySelector("button").disabled = true;
	
var stripe= Stripe('pk_test_51HSNExCvhqAQzpWrbMDvO0jEtv7TebySMaItQpBtcP4JS1Ji75jY0WAj7bbrfIEmxfnQcQ3fUuzz36khFmFCyXDV00BQDc5YlT');
var elements = stripe.elements();
	
var style = {
  base: {
	  color: "#32325d",
  }	
};
var card = elements.create("card",{style: style});
	card.mount("#card-element");
	
	card.addEventListener('change', function(event){
		var displayError = document.getElementById('card-errors');
		if(event.error){
			errorHandler(event.error.message);
		}
		else{ 
			errorHandler('');
		}
	});
	
	var form = document.getElementById('payment-form');
	
	form.addEventListener('submit', function(ev){
		ev.preventDefault();
		changeLoadingState(true);
		
   stripe.createPaymentMethod("card", card).then(function(result){
			if(result.error) {
		errorHandler(result.error.message);	
		   	}
			else{
			orderData.paymentMethodId = result.paymentMethod.id;
				return fetch("/pay",{
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(orderData)
				});
			}
		})
		.then(function(result){
	   return result.json();
   })
		.then(function(response){
	   if(response.error){
		 errorHandler(response.error);
	   }
	   else{
		   changeLoadingState(false);
		  window.location.href='/restaurants?paid=true'
		   //redirect to campground after accepting payment
	   }
   }).catch(function(err){
			errorHandler(err.error);
   });
	});

// Show a spinner on payment submission
function changeLoadingState(isLoading) {
  if (isLoading) {
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
};