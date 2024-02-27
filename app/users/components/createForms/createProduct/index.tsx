import { productsService } from "@/api";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useDropzone } from "react-dropzone";

const ProductForm = (props: any) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [success, setSuccess] = useState(false);

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
    maxFiles: 1,
    maxSize: 1000000,
  });

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      setImage(acceptedFiles[0]);
    }
  }, [acceptedFiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await productsService.createProduct(
      {
        Name: name,
        Price: price,
        Description: description,
        Image: image,
        StoreID: props.storeId,
      },
      props.auth.jwt
    );

    if (res.status === 201) {
      setSuccess(true);
      setName("");
      setPrice("");
      setDescription("");
      setImage(null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-2/3 p-4 flex-col space-y-2 md:space-y-4"
    >
      <div className="flex flex-col">
        <div className="flex flex-row justify-between mb-2">
          <div className="flex flex-col w-2/4">
            <label htmlFor="name" className="mb-2 font-medium text-lg">
              Name:
            </label>
            <input
              id="name"
              value={name}
              placeholder="Gadget"
              onChange={(e) => setName(e.target.value)}
              className="border w-full border-gray-400 rounded-md py-2 px-3 bg-transparent border-2 rounded p-1"
            />
          </div>
          <div className="flex flex-col w-1/3">
            <label htmlFor="price" className="mb-2 font-medium text-lg">
              Price:
            </label>
            <input
              id="price"
              value={price}
              placeholder="0.00"
              onChange={(e) => setPrice(e.target.value)}
              className="border w-full border-gray-400 rounded-md py-2 px-3 bg-transparent border-2 rounded p-1"
            />
          </div>
        </div>
        <div className="flex flex-col mb-2">
          <label htmlFor="description" className="mb-2 font-medium text-lg">
            Description:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border h-28 border-gray-400 rounded-md py-2 px-3 bg-transparent border-2 rounded p-1"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="image" className="mb-2 font-medium text-lg">
            Image:
          </label>
          <section className=" flex flex-col border-2 rounded-md h-32">
            <div {...getRootProps({ className: "dropzone h-full w-full p-4" })}>
              <input {...getInputProps()} />
              <p>
                {"Drag 'n' drop the image here, or click to select the file:"}
              </p>
              {image && <p>{image.name}</p>}
            </div>
          </section>
        </div>
      </div>
      <button
        type="submit"
        className="w-full text-white bg-[#182628] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-xl block py-2.5 text-center"
      >
        Create Product
      </button>
      {success && <p className="text-green-500">Store created successfully</p>}
    </form>
  );
};

const mapStateToProps = (state: any) => {
  return {
    auth: state.auth,
  };
};

export default connect(mapStateToProps)(ProductForm);
