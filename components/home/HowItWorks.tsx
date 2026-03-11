import React from "react";
import Container from "@/components/layout/Container";

const steps = [
  { id: 1, title: "Search", description: "Find rooms in your desired city by filtering on budget, stay type, and amenities.", icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ) },
  { id: 2, title: "Request", description: "Found a place you love? Send a booking request directly to the owner with one click.", icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
    ) },
  { id: 3, title: "Stay", description: "Once approved, move in and enjoy your new home. It's really that simple.", icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ) },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="bg-gray-50 py-20 lg:py-28">
      <Container>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="mb-3 inline-block rounded-full bg-rose-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-rose-600">
            Simple Process
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            Three easy steps to find and secure your perfect living space.
          </p>
        </div>
        <div className="relative mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[16.666%] right-[16.666%] top-12 hidden h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent md:block" />
          {steps.map((step) => (
            <div key={step.id} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-lg shadow-rose-100/50 ring-1 ring-gray-100 transition-transform duration-300 hover:scale-110">
                {step.icon}
              </div>
              <span className="mt-5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                {step.id}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default HowItWorks;
