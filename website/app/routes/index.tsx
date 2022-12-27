import styles from "~/styles/index.css";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function Index() {
  return (
    <p style={{ fontFamily: "InterRegular" }}>
      Your invite to the Yours closed beta has been confirmed.
    </p>
  );
}
