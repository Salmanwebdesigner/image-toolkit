/** @type {import('next').NextConfig} */

const isGithubActions = process.env.GITHUB_ACTIONS === "true";

module.exports = {
  output: "export",
  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  basePath: isGithubActions ? "/image-toolkit" : "",
  assetPrefix: isGithubActions ? "/image-toolkit" : "",
};