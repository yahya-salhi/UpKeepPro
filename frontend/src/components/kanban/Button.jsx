import { forwardRef } from "react";
import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";
import { Loader } from "lucide-react"; // You'll need this component

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className,
      disabled,
      isLoading,
      loadingText,
      icon,
      iconPosition = "left",
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";

    const sizeClasses = {
      xs: "px-2.5 py-1.5 text-xs",
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-4 py-2 text-base",
      xl: "px-6 py-3 text-base",
    };

    const variantClasses = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border border-transparent",
      secondary:
        "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-blue-500 border border-gray-300 dark:border-gray-600",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent",
      ghost:
        "bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-blue-500 border border-transparent",
      link: "bg-transparent text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-600 focus:ring-blue-500 underline border-transparent",
    };

    const disabledClasses = "opacity-50 cursor-not-allowed";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={twMerge(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          (disabled || isLoading) && disabledClasses,
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="mr-2">
            <Loader size={size} />
          </span>
        )}
        {!isLoading && icon && iconPosition === "left" && (
          <span className="mr-2">{icon}</span>
        )}
        {isLoading && loadingText ? loadingText : children}
        {!isLoading && icon && iconPosition === "right" && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "ghost", "link"]),
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  loadingText: PropTypes.string,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  type: PropTypes.oneOf(["button", "submit", "reset"]),
};

export default Button;
