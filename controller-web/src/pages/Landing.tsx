import { getUserAgent } from "../features/user-agent";

export const Landing = () => {
  return (
    <div>
      <div>Landing Page</div>
      <div>browser: {getUserAgent().browser}</div>
      <div>os: {getUserAgent().os}</div>
      <div>version: {getUserAgent().version}</div>
    </div>
  );
};
