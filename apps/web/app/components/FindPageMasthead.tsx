import type { ReactNode } from "react";

export type FindPageStat = {
  label: string;
  value: string | number;
};

type Props = {
  kicker: string;
  title: ReactNode;
  lede: ReactNode;
  stats?: FindPageStat[];
};

export default function FindPageMasthead({
  kicker,
  title,
  lede,
  stats,
}: Props) {
  return (
    <header className="find-page__head">
      <div className="find-page__intro">
        <p className="find-page__kicker">{kicker}</p>
        <h1 className="find-page__title">{title}</h1>
        <div className="find-page__lede">{lede}</div>
      </div>
      {stats && stats.length > 0 ? (
        <dl className="find-page__stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </header>
  );
}
