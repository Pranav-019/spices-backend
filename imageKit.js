var ImageKit = require("imagekit");

// Initialize ImageKit with environment variables
var imagekit = new ImageKit({
  publicKey 
:
 
"public_qi3EWYxneVxDTRQu8UuuJdfnZh4="
,

    privateKey 
:
 
"private_AYcnS11x1zN5aZoPt8vaMf4czS0="
,

    urlEndpoint 
:
 
"https://ik.imagekit.io/nuqwnac8f" // URL endpoint
});

console.log(process.env.IMAGEKIT_PUBLIC_KEY);

module.exports = imagekit;
