import Table from "@/components/Table";
import { FaPlus, FaSave, FaArrowLeft } from 'react-icons/fa';


const Home: React.FC = () => {
  return (
    <div className="p-4">
      <div className="flex flex-row justify-end gap-8 m-8">
        <button>
          <FaPlus className="text-lg" />
        </button>
        <button>
          <FaSave className="text-lg" />
        </button>
        <button>
          <FaArrowLeft className="text-lg" />
        </button>
      </div>
      <Table />
    </div>
  );
};

export default Home;