import { Link, type LinkProps } from 'react-router';

type RouterLinkProps = Omit<LinkProps, 'to'> & { href: string };

/** Adapter for komponenter som rendrer lenker med `href`, f.eks. DibkAppShell. */
export default function RouterLink({ href, ...props }: RouterLinkProps) {
    return (
        <Link
            to={href}
            {...props}
        />
    );
}
