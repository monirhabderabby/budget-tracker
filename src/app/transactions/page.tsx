import dynamic from "next/dynamic";
const TransactionTableContainer = dynamic(
  () => import("./_components/transaction-table-container")
);

const Page = () => {
  return <TransactionTableContainer />;
};

export default Page;
