let websites = ["Index", "Videos", "Game", "Paint", "Portfolio"];
let subNames = ["Home", "Video Gallery", "Game", "Paint", "Portfolio"]
let embedHTML = `
<div class="title">
    <h6 class="nonselectable">theKlebSite</h6>
</div>
<div>
    <div class="navbar nonselectable">`
for(let i = 0; i < websites.length; i++)
    embedHTML += `<a class="navbar-element" href="${websites[i].toLowerCase()}.html">${subNames[i]}</a>`; 
embedHTML += `
    </div>
</div>`;
document.write(embedHTML);