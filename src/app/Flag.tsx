/* eslint-disable @next/next/no-img-element */
export default function Flag({ iso2, size = 20 }: { iso2: string; size?: number }) {
  return (
    <img
      src={`https://flagcdn.com/w${size}/${iso2}.png`}
      srcSet={`https://flagcdn.com/w${size * 2}/${iso2}.png 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt=""
      className="inline-block rounded-sm"
      loading="lazy"
    />
  );
}
