const SearchPage = async ({ searchParams }: { searchParams: string }) => {
  const q = await searchParams;
  console.log(q);
  return <div>SearchPage</div>;
};
export default SearchPage;
