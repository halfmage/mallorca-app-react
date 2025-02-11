import React from 'react'
import MainStep from './MainStep'

const SignUp = ({ onSubmit }) => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="border-2 border-gray-300 p-4">
        <MainStep onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default SignUp
