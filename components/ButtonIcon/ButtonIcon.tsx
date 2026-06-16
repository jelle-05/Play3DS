import Link from "next/link";
import "./ButtonIcon.css";

interface ButtonIconProps {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
}

export default function ButtonIcon({ href, label, variant = "primary" }: ButtonIconProps) {
  return (
    <Link href={href} className={`btn-icon-link btn-icon-link--${variant}`}>
      <div className="btn-icon-content">
        <div className="btn-icon-content__mask">
          <span data-button-anim-target="" className="btn-icon-content__text">
            {label}
          </span>
        </div>
        <div data-icon-size="normal" className="btn-icon-icon">
          <div data-button-anim-target="" className="btn-icon-icon__bg" />
          <div className="btn-icon-icon__wrap">
            <div className="btn-icon-icon__list">
              {[0, 1, 2].map((i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  viewBox="0 0 10 8"
                  fill="none"
                  data-button-anim-target=""
                  className="btn-icon-icon__arrow"
                  aria-hidden="true"
                >
                  <path
                    d="M4.45231 0.385986H6.02531L9.30131 3.99999L6.02531 7.61399H4.45231L7.40331 4.58499H0.695312V3.42799H7.41631L4.45231 0.385986Z"
                    fill="currentColor"
                  />
                </svg>
              ))}
            </div>
          </div>
        </div>
        <div data-button-anim-target="" className="btn-icon-content__bg" />
      </div>
    </Link>
  );
}
