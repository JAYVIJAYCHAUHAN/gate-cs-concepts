// =============================
// Subject Search
// =============================

const searchBox = document.getElementById("search");

if (searchBox) {

    searchBox.addEventListener("keyup", function () {

        let value = this.value.toLowerCase();

        let cards = document.querySelectorAll(".card");

        cards.forEach(function(card){

            let text = card.innerText.toLowerCase();

            if(text.includes(value)){
                card.style.display = "block";
            }else{
                card.style.display = "none";
            }

        });

    });

}


// =============================
// Visitor Counter (Temporary)
// =============================

// Replace this later with GoatCounter or Google Analytics.

const visitor = document.getElementById("visitor-count");

if(visitor){

    visitor.innerHTML = "Coming Soon";

}


// =============================
// Smooth Scroll
// =============================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function(e){

        e.preventDefault();

        document.querySelector(this.getAttribute("href"))
            .scrollIntoView({

                behavior:"smooth"

            });

    });

});
