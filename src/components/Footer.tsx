function Footer() {
    return (
      <footer className="bg-black text-gray-400 py-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 sm:grid-cols-2 gap-8 px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">About Us</h2>
            <p className="mb-4">
                We will make you drip for the recipes.
            </p>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">Quick Links</h2>
            <ul>
              <li>
                <a
                  href="/"
                  className="hover:text-white transition-colors duration-300"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="hover:text-white transition-colors duration-300"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/recipes"
                  className="hover:text-white transition-colors duration-300"
                >
                  Recipes
                </a>
              </li>
              <li>
                <a
                  href="mailto:gurmeharsinghv@gmail.com"
                  className="hover:text-white transition-colors duration-300"
                >
                  Mail Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">Follow Us</h2>
            <div className="flex space-x-4">
              <a
                href="https://github.com/Garvit-Nag/reciperover"
                className="hover:text-white transition-colors duration-300"
              >
                Github
              </a>
              <a
                href="https://www.instagram.com/_gsv_._/"
                className="hover:text-white transition-colors duration-300"
              >
                Instagram
              </a>
            </div>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">Contact Us</h2>
            <p>Punjab, India</p>
            <p>Mohali 160055</p>
            <p>gurmeharsinghv@gmail.com</p>
            <p>+91 98779 26632</p>
            {/* <p>or +91 62390 89128</p> */}
          </div>
          </div>
          <p className="text-center text-xs pt-8">© 2024 Recipe Rover. All rights reserved.</p>
      </footer>
    )
  }
  
  export default Footer;