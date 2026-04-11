const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // force redirect
  window.location.href = "/login";
};

export default logout;
