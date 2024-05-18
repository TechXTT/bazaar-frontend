import { disputesService } from "@/api";
import { IMessage } from "@/api/interfaces/disputes";
import { IOrder } from "@/api/interfaces/products";
import { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import useWebSocket from "react-use-websocket";
import {useDropzone} from 'react-dropzone';
import { CONFIG } from "@/config/config";
import { ethers } from "ethers";
import { ABI } from "@/escrow_abi";
import { messageToBytes32 } from "@/utils/helpers";
import BucketImage from "@/app/components/image";

const OpenDispute = (props: any) => {
  const order: IOrder = props.order;
  const handleOpenDispute = async () => {
    const res = await disputesService.createDispute(
      { OrderID: order?.ID, Dispute: description, Images: acceptedFiles,},
      props.auth.jwt
    );

    if (res.status === 201) {
      fetchDispute();
    }
  };

  const handleCloseDispute = async () => {
    
    
    const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const escrow = new ethers.Contract(
        CONFIG.CONTRACT_ADDRESS,
        ABI,
        signer
      );
      
      if (order.BuyerID === props.auth.user.ID) {
        const res = await disputesService.closeDispute(
          order?.ID,
          props.auth.jwt
        );
      } else {

        const result = await escrow.refundOrder(
          messageToBytes32(order.ID)
        );

        console.log("result", result);
      }

      fetchDispute()
  }

  // let socket;

  const [loading, setLoading] = useState<boolean>(true);
  // const [messages, setMessages] = useState<IMessage[]>([]);
  // const [newMessage, setNewMessage] = useState<any>({} as any);
  const [description, setDescription] = useState<string>("");

  // const connection = useRef<WebSocket | null>(null);

  const {acceptedFiles, getRootProps, getInputProps} = useDropzone({
    accept: {'image/*': ['.jpg', '.jpeg', '.png']},
    maxFiles: 5,
    maxSize: 10000000,
});

  const fetchDispute = async () => {
    try {
      const res = await disputesService.getDisputeByOrderID(
        order?.ID,
        props.auth.jwt
      );
      if (res.status === 200) {
        console.log("dispute", res.data);
        props.setDispute(res.data);
        // if (res.data?.Messages)
        //   setMessages({...res.data.Messages});
        // console.log('ws', `ws://localhost:8000/api/ws/join/${order?.ID}?userId=${props.auth.user.ID}&username=${props.auth.user.FirstName}%20${props.auth.user.LastName}`);
        // const socket = new WebSocket(`ws://localhost:8000/api/ws/join/${order?.ID}?userId=${props.auth.user.ID}&username=${props.auth.user.FirstName}%20${props.auth.user.LastName}`);

        // socket.addEventListener('open', (event) => {
        //   console.log('Connected to websocket');
        // })

        // socket.addEventListener('message', (event) => {
        //   console.log('Message from server', event.data);
        //   const parseMessage: any = {
        //     Message: event.data.Content,

        //   }
        //   setMessages([...messages, JSON.parse(event.data)]);
        // })

        // connection.current = socket;

        console.log("res", res);

        setLoading(false);

        // return () => {
        //   console.log('closing socket');
        //   socket.close();
        // }
      }

      setLoading(false);
    } catch (error) {
      console.log("error", error);
      setLoading(false);
    }
  };

  useEffect(() => {

    if (!props.auth.user) {
      window.location.href = "/auth/login"
    }

    if (loading) {
      fetchDispute();
    }
  }, [order]);

  useEffect(() => {
      console.log(acceptedFiles);
  }, [acceptedFiles]);

  return (
    <div className="flex w-full flex-row  h-full ">

      <div className="flex w-full flex-col items-left pl-4">
        <h2 className="text-3xl">Order Details: </h2>
        <p className="text-2xl">Order Status: {order?.Status}</p>
        <p className="text-2xl">Order Total: {order?.Total}</p>
      </div>
      {!loading ? (
        !props.dispute && order.BuyerID == props.auth.user.ID ? (
          <div className="flex w-full h-full flex-col items-left ">
            <label htmlFor="description" className="mb-2 font-medium text-lg">
                        Description:
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="border h-36 mb-2 border-gray-400 rounded-md py-2 px-3 bg-transparent border-2 rounded p-1"
                    />
                    <label htmlFor="image" className="mb-2 font-medium text-lg">
                        Images:
                    </label>
                    {acceptedFiles.map((file) => (
                                <p key={file.name}>{file.name}</p>
                            ))}
                    <section className=" flex flex-col mb-2 border-2 rounded-md h-32">
                        <div {...getRootProps({className: 'dropzone h-full w-full p-4'})}>
                            <input {...getInputProps()} />
                            <p>{"Drag 'n' drop the images here, or click to select the file:"}</p>
                            
                        </div>
                    </section>
            <button
              onClick={() => {
                handleOpenDispute();
              }}
              type="submit"
                className="w-full text-white bg-[#182628] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-xl block py-2.5 text-center"
            
            >
              Open Dispute
            </button>

          </div>
        ) : props.dispute ? (
          <div className="flex w-full h-full flex-col items-left ">
            {/* <div>
                    {messages.length !== 0 ? messages.map((message, index) => (
                        <div key={index}>
                            <p>{message.Message}</p>
                        </div>
                    )) : null}
                </div>
                <div>
                    <input type="text" onChange={(e) => setNewMessage({Message: e.target.value})} />
                    <button onClick={() => {
                        connection.current?.send(JSON.stringify(newMessage));
                    }}>Send</button>
                </div> */}

            <h2 className="text-3xl">Dispute Details: </h2>
            <p className=" ml-2 text-2xl">Dispute Description:</p>
            <p className="ml-2 text-2xl border rounded p-1">{props.dispute?.Dispute}</p>
              <h2 className="ml-2 text-3xl">Dispute Images: </h2>
            <div className="ml-2 grid grid-auto-fit">
            {props.dispute?.Images?.map((image: any, index: any) => (
              
              <BucketImage
                key={index}
                className="w-28 h-28 object-cover rounded-lg mr-8"
                imageURL={image.Image}
                name={image.Image}
              />
              

            ))}
            </div>
              <div className="flex w-full mt-2 justify-center">
            <button
              onClick={() => {
                handleCloseDispute();
              }}
              type="submit"
                className="w-full text-white bg-[#182628] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-xl block py-2.5 text-center disabled:opacity-50"
              disabled={order.Status === 'cancelled'}
            >
              {order.BuyerID === props.auth.user.ID ? "Cancel Dispute" : "Approve Dispute"}
            </button>
            </div>
          </div>
        ) : (
          <div></div>
        )
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    auth: state.auth,
  };
};

export default connect(mapStateToProps)(OpenDispute);
