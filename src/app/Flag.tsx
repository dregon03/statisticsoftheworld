/* eslint-disable @next/next/no-img-element */
export default function Flag({ iso2, size = 20 }: { iso2: string; size?: number }) {
  // flagcdn supports: w20, w40, w80, w160, w320
  const w = size <= 20 ? 20 : size <= 40 ? 40 : 80;
  return (
    <img
      src={`https://flagcdn.com/w${w}/${iso2}.png`}
      srcSet={`https://flagcdn.com/w${Math.min(w * 2, 320)}/${iso2}.png 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt=""
      className="inline-block rounded-sm shrink-0"
      loading="lazy"
    />
  );
}
