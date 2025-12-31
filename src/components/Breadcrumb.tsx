import { Link } from "react-router";

interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
    return (
        <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb mb-0">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={index} className={`breadcrumb-item ${isLast ? "active" : ""}`}>
                            {isLast || !item.path ? (
                                <span>{item.label}</span>
                            ) : (
                                <Link to={item.path} className="text-decoration-none">
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;


