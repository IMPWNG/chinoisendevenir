const handleSubmit = async () => {
  const { error } = await supabase.from("contacts").upsert({
    prenom,
    email,
    phone,
    source: "website",
  });

  if (error) {
    console.error(error);
  } else {
    console.log("Saved ✅");
  }
};
