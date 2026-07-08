import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand">
              <div className="brand-mark">VL</div>
              <div className="brand-text">
                <div className="t1">Virginia Legends</div>
                <div className="t2">CRICKET CLUB</div>
              </div>
            </div>
            <p>The Virginia Legends 6-a-side Cricket Carnival — since 2008. 16 teams, four groups, one trophy, open to VA, MD &amp; DC.</p>
            <div className="socials">
              <a href="https://www.facebook.com/valegends" target="_blank" rel="noopener noreferrer" className="social" aria-label="Virginia Legends on Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
                </svg>
                <span>Follow us on Facebook</span>
              </a>
            </div>
          </div>

          <div>
            <h4>Tournament</h4>
            <ul>
              <li><Link to="/points-table">Points Table</Link></li>
              <li><Link to="/knockouts">Knockout Bracket</Link></li>
              <li><Link to="/fixtures">Fixtures &amp; Results</Link></li>
              <li><Link to="/teams">Teams</Link></li>
              <li><Link to="/register">Register a Team</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:valegends@hotmail.com">valegends@hotmail.com</a></li>
              <li><a href="tel:+17035072466">(703) 507-2466</a></li>
              <li><a href="tel:+15713957054">(571) 395-7054</a></li>
              <li><a href="tel:+15716204641">(571) 620-4641</a></li>
              <li>Fairfax, VA</li>
              <li><a href="https://www.facebook.com/valegends" target="_blank" rel="noopener noreferrer">facebook.com/valegends</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Virginia Legends Cricket Club. All rights reserved.</span>
          <span>Made for the love of the game 🏏</span>
        </div>
      </div>
    </footer>
  )
}
