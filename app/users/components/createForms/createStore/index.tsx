import { storesService } from '@/api';
import React, { useState } from 'react';
import { connect } from 'react-redux';

const StoreForm: React.FC = (props: any) => {
    const [name, setName] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await storesService.createStore({name}, props.auth.jwt)

        if (res.status === 201  ) {
            setSuccess(true);
            setName('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex w-1/3 p-4 flex-col space-y-2 md:space-y-4">
            <div className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <label htmlFor="firstName" className="mb-2 font-medium text-lg">
                Name:
              </label>
              <input
                id="firstName"
                value={name}
                placeholder='Store Name'
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-400 rounded-md py-2 px-3 text-black"
              />
            </div>
            
          </div>
          <button
          type="submit"
          className="w-full text-white bg-[#182628] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-xl block py-2.5 text-center"
        >
          Create Store
        </button>
        {success && (
            <p className="text-green-500">Store created successfully</p>
        )}
        </form>
        
    );
};

const mapStateToProps = (state: any) => {
    return {
      auth: state.auth,
    };
  };
  
export default connect(mapStateToProps)(StoreForm);