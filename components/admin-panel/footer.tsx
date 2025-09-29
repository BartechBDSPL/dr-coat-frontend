import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 flex h-14 items-center md:mx-8">
        <p className="flex items-center text-left text-xs leading-loose text-muted-foreground md:text-sm">
          Built and maintained by{' '}
          <Link
            href="https://bartechdata.net"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 font-medium underline underline-offset-4"
          >
            Bartech Data System Pvt. Ltd.
            <Image
              alt="bartech-logo"
              src="/images/bartech.png"
              width={60}
              height={25}
              className="ml-2 inline-block dark:bg-white"
            />
          </Link>
        </p>
      </div>
    </div>
  );
}
