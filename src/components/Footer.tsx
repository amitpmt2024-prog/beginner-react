import { Link } from "react-router-dom";
import { Facebook, Instagram } from "@mui/icons-material";
import styles from "./Footer.module.css";

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  ariaLabel: string;
}

const Footer = () => {

  const socialLinks: SocialLink[] = [
    {
      name: "Facebook",
      url: "https://facebook.com",
      icon: <Facebook sx={{ fontSize: 32 }} />,
      color: "#1877F2",
      ariaLabel: "Visit our Facebook page",
    },
    {
      name: "Instagram",
      url: "https://instagram.com",
      icon: <Instagram sx={{ fontSize: 32 }} />,
      color: "#E4405F",
      ariaLabel: "Visit our Instagram page",
    },
  ];

  const navigationLinks = [
    { path: "/", label: "Home" },
    { path: "/product", label: "Products" },
  ];

  const infoLinks = [
    { path: "/about", label: "About Us" },
    { path: "/contact", label: "Contact Us" },
    { path: "/my-profile", label: "My Profile" },
    { path: "/orders", label: "Order History" },
  ];

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0">
            <h5 className={styles.footerHeading}>Navigation</h5>
            <nav aria-label="Footer navigation">
              <ul className={styles.footerLinks}>
                {navigationLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className={styles.footerLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="col-md-4 mb-4 mb-md-0">
            <h5 className={styles.footerHeading}>Information</h5>
            <nav aria-label="Footer information links">
              <ul className={styles.footerLinks}>
                {infoLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className={styles.footerLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="col-md-4 text-md-end">
            <h5 className={styles.footerHeading}>Follow Us</h5>
            <div className={styles.footerSocial}>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerSocialLink}
                  aria-label={social.ariaLabel}
                  style={{ "--hover-color": social.color } as React.CSSProperties}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
