import React from "react";
import { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { Rating } from "primereact/rating";
import { Toolbar } from "primereact/toolbar";
import { InputTextarea } from "primereact/inputtextarea";
import { RadioButton } from "primereact/radiobutton";
import { InputNumber } from "primereact/inputnumber";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { ProductService } from "../service/ProductService";

export const Objections = () => {
    let emptyPoliticalParty = {
        id: null,
        ObjName: "",
        image: null,
        voterid: "",
        reason: "",
        slogan: "",
        category: null,
        price: 0,
        quantity: 0,
        rating: 0,
        date: "",
        date1: "",
    };
    const [politicalParty, setPoliticalParty] = useState({
        date: "",
        date1: "",
    });

    const onGetInput = (value, key) => {
        setPoliticalParty({ ...politicalParty, [key]: value });
    };

    const [products, setProducts] = useState([]);
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
    const [product, setProduct] = useState(emptyPoliticalParty);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    // useEffect(() => {
    //     const productService = new ProductService();
    //     productService.getProducts().then((data) => setProducts(data));
    // }, []);

    const openNew = () => {
        setProduct(emptyPoliticalParty);
        setSubmitted(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const hideDeleteProductsDialog = () => {
        setDeleteProductsDialog(false);
    };

    const saveProduct = () => {
        setSubmitted(true);
        console.log(product);
        if (product.ObjName.trim()) {
            let _products = [...products];
            let _product = { ...product };
            if (product.id) {
                const index = findIndexById(product.id);

                _products[index] = _product;
                toast.current.show({
                    severity: "success",
                    summary: "Successful",
                    detail: "Product Updated",
                    life: 3000,
                });
            } else {
                _product.id = createId();
                _product.image = "product-placeholder.svg";
                _products.push(_product);
                toast.current.show({
                    severity: "success",
                    summary: "Successful",
                    detail: "Product Created",
                    life: 3000,
                });
            }

            setProducts(_products);
            setProductDialog(false);
            setProduct(emptyPoliticalParty);
        }
    };

    const editProduct = (product) => {
        setProduct({ ...product });
        setProductDialog(true);
    };

    const confirmDeleteProduct = (product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    };

    const deleteProduct = () => {
        let _products = products.filter((val) => val.id !== product.id);
        setProducts(_products);
        setDeleteProductDialog(false);
        setProduct(emptyPoliticalParty);
        toast.current.show({
            severity: "success",
            summary: "Successful",
            detail: "Product Deleted",
            life: 3000,
        });
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < products.length; i++) {
            if (products[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const createId = () => {
        let id = "";
        let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteProductsDialog(true);
    };

    const deleteSelectedProducts = () => {
        let _products = products.filter((val) => !selectedProducts.includes(val));
        setProducts(_products);
        setDeleteProductsDialog(false);
        setSelectedProducts(null);
        toast.current.show({
            severity: "success",
            summary: "Successful",
            detail: "Products Deleted",
            life: 3000,
        });
    };

    const onCategoryChange = (e) => {
        let _product = { ...product };
        _product["category"] = e.value;
        setProduct(_product);
    };

    const onInputChange = (e, ObjName) => {
        var val = "";
        if (e?.value) val = e.value.toString();
        else if (e?.target) val = e.target.value;
        else val = "";

        let _product = { ...product };
        _product[`${ObjName}`] = val.toString();
        setProduct(_product);
    };

    const onInputNumberChange = (e, ObjName) => {
        const val = e.value || 0;
        let _product = { ...product };
        _product[`${ObjName}`] = val;

        setProduct(_product);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Add Objection" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    {/* <Button label="Delete Ojection" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} /> */}
                </div>
            </React.Fragment>
        );
    };
    const leftToolbar = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <text>Buttons will come here</text>
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                {/* <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} label="Import" chooseLabel="Import" className="mr-2 inline-block" /> */}
                {/* <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} /> */}
            </React.Fragment>
        );
    };

    const nameBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                {rowData.ObjName}
            </>
        );
    };

    const priceBodyTemplate = (rowData) => {
        return <>{rowData.voterid}</>;
    };
    const RegisteredBodyTemplate = (rowData) => {
        return <>{rowData.date}</>;
    };
    const AnniversaryBodyTemplate = (rowData) => {
        return <>{rowData.date1}</>;
    };

    const categoryBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Actions</span>
                <div className="actions">
                    <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editProduct(rowData)} />
                    <Button icon="pi pi-trash" className="p-button-rounded p-button-danger mt-2" onClick={() => confirmDeleteProduct(rowData)} />
                </div>
            </>
        );
    };

    const codeBodyTemplate = (rowData) => {
        return <>{rowData.reason}</>;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                {/* <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editProduct(rowData)} />
                    <Button icon="pi pi-trash" className="p-button-rounded p-button-danger mt-2" onClick={() => confirmDeleteProduct(rowData)} /> */}
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Objections</h5>
        </div>
    );

    const productDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveProduct} />
        </>
    );
    const deleteProductDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteProduct} />
        </>
    );
    const deleteProductsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProductsDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedProducts} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbar}></Toolbar>

                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={products}
                        selection={selectedProducts}
                        onSelectionChange={(e) => setSelectedProducts(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Objections"
                        globalFilter={globalFilter}
                        emptyMessage="No objections found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }}></Column>
                        <Column field="ObjName" header="Name" sortable body={nameBodyTemplate} headerStyle={{ width: "14%", minWidth: "10rem" }}></Column>
                        <Column field="voter ID" header="Voter ID" body={priceBodyTemplate} headerStyle={{ width: "14%", minWidth: "8rem" }}></Column>
                        <Column field="reason" header="Reason" body={codeBodyTemplate} headerStyle={{ width: "14%", minWidth: "10rem" }}></Column>
                        <Column field="Date Lodged" header="Date Lodged" body={RegisteredBodyTemplate} headerStyle={{ width: "14%", minWidth: "10rem" }}></Column>
                        <Column field="actions" header="Actions" body={categoryBodyTemplate} headerStyle={{ width: "14%", minWidth: "10rem" }}></Column>
                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={productDialog} style={{ width: "450px" }} header="Details" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                        {product.image && <img src={`assets/demo/images/product/${product.image}`} alt={product.image} width="150" className="mt-0 mx-auto mb-5 block shadow-2" />}
                        <div className="field">
                            <label htmlFor="ObjName">Name</label>
                            <InputText
                                id="ObjName"
                                value={product.ObjName}
                                onChange={(e) => onInputChange(e, "ObjName")}
                                required
                                autoFocus
                                className={classNames({
                                    "p-invalid": submitted && !product.ObjName,
                                })}
                            />
                            {submitted && !product.ObjName && <small className="p-invalid">Name is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="voterid">Voter ID</label>
                            <InputText id="voterid" value={product.voterid} onChange={(e) => onInputChange(e, "voterid")} required rows={3} cols={20} />
                        </div>
                        <div className="field">
                            <label htmlFor="reason">Reason</label>
                            <InputTextarea id="reason" value={product.reason} onChange={(e) => onInputChange(e, "reason")} required rows={4} cols={20} />
                        </div>

                        <div className="field">
                            <label className="mb-3">Date lodged</label>
                            <Calendar value={product.date} onChange={(e) => onInputChange(e, "date")} showIcon={true}></Calendar>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProductDialog} style={{ width: "450px" }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
                            {product && (
                                <span>
                                    Are you sure you want to delete <b>{product.ObjName}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProductsDialog} style={{ width: "450px" }} header="Confirm" modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
                            {product && <span>Are you sure you want to delete the selected products?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};
